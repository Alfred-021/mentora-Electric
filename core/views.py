from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.db.models import Sum, Q

from core.models import Product, Cart, CartItem, Category, Favorite

def _cart_count(request):
    if not request.user.is_authenticated:
        return 0
    total = CartItem.objects.filter(cart__user=request.user).aggregate(total=Sum('quantity'))['total']
    return total or 0


# ----------------------
# HOME & STATIC PAGES
# ----------------------

def home(request):
    products = Product.objects.select_related('category').all()  # ← always defined first
    categories = Category.objects.all()

    # 🔍 SEARCH
    query = request.GET.get('q', '').strip()
    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        )

    # 🏷 CATEGORY FILTER
    category = request.GET.get('category', 'all') or 'all'  # ← 'or all' guards against empty string
    if category == 'featured':
        products = products.filter(is_featured=True)
    elif category == 'new':
        products = products.filter(is_new=True)
    elif category == 'out-of-stock':
        products = products.filter(in_stock=False)
    elif category != 'all':
        products = products.filter(category__slug=category)
    # if category == 'all' → no filter, show everything ✓

    # 🔄 SORT
    sort = request.GET.get('sort', '') or ''  # ← guards against None
    sort_map = {
        'name-asc':   'name',
        'name-desc':  '-name',
        'price-low':  'price',
        'price-high': '-price',
    }
    if sort in sort_map:
        products = products.order_by(sort_map[sort])

        # Favourites
    user_favourites = []
    favourite_products = []
    if request.user.is_authenticated:
        user_favourites = list(
            Favorite.objects.filter(user=request.user).values_list('product_id', flat=True)
        )
        favourite_products = Product.objects.filter(
            id__in=user_favourites
        ).select_related('category')

    return render(request, 'index.html', {
        'products': products,
        'categories': categories,
        'current_category': category,
        'current_sort': sort,
        'current_query': query,
        'cart_count': _cart_count(request),
        'user_favourites': user_favourites,           # ← list of IDs for heart toggle
        'favourite_products': favourite_products,
    })

   


def about(request):
    return render(request, 'about.html')


def add_to_cart(request, product_id):
    if not request.user.is_authenticated:
        messages.error(request, 'Please sign in to add items to cart.')
        return redirect('auth')

    if request.method != 'POST':
        return redirect('home')

    product = Product.objects.filter(pk=product_id).first()
    if not product:
        messages.error(request, 'Product not found.')
        return redirect('home')

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        item.quantity += 1
        item.save(update_fields=['quantity'])

    messages.success(request, f'Added {product.name} to cart.')
    return redirect(request.META.get('HTTP_REFERER', 'home'))


@login_required(login_url='auth')
def cart_view(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_items = CartItem.objects.filter(cart=cart).select_related('product')
    items = []
    total = 0

    for item in cart_items:
        line_total = item.product.price * item.quantity
        total += line_total
        items.append({
            'product': item.product,
            'quantity': item.quantity,
            'line_total': line_total,
        })

    return render(request, 'cart.html', {
        'items': items,
        'total': total,
        'cart_count': _cart_count(request),
    })


@login_required(login_url='auth')
def update_cart_item(request, product_id):
    if request.method != 'POST':
        return redirect('cart')

    cart, _ = Cart.objects.get_or_create(user=request.user)
    item = CartItem.objects.filter(cart=cart, product_id=product_id).first()
    if not item:
        messages.error(request, 'Cart item not found.')
        return redirect('cart')

    try:
        quantity = int(request.POST.get('quantity', item.quantity))
    except (TypeError, ValueError):
        messages.error(request, 'Invalid quantity value.')
        return redirect('cart')

    if quantity <= 0:
        item.delete()
        messages.success(request, 'Item removed from cart.')
    else:
        item.quantity = quantity
        item.save(update_fields=['quantity'])
        messages.success(request, 'Cart updated.')

    return redirect('cart')


@login_required(login_url='auth')
def remove_cart_item(request, product_id):
    if request.method != 'POST':
        return redirect('cart')

    cart, _ = Cart.objects.get_or_create(user=request.user)
    deleted, _ = CartItem.objects.filter(cart=cart, product_id=product_id).delete()
    if deleted:
        messages.success(request, 'Item removed from cart.')
    else:
        messages.error(request, 'Cart item not found.')

    return redirect('cart')


def auth_page(request):
    return render(request, 'auth.html')


# ----------------------
# REGISTER
# ----------------------

def register_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return redirect('auth')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect('auth')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered")
            return redirect('auth')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Auto login after registration
        login(request, user)

        messages.success(request, "Account created successfully")
        return redirect('home')

    return redirect('auth')


# ----------------------
# LOGIN
# ----------------------

def login_user(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('home')  # Redirect to homepage
        else:
            messages.error(request, "Invalid username or password")
            return redirect('auth')

    return redirect('auth')


# ----------------------
# USER DASHBOARD (Optional)
# ----------------------

@login_required(login_url='auth')
def dashboard(request):
    return render(request, 'dashboard.html')  # Create dashboard.html

@login_required(login_url='auth')
def toggle_favourite(request, product_id):
    if request.method == 'POST':
        product = Product.objects.filter(pk=product_id).first()
        if product:
            fav, created = Favorite.objects.get_or_create(
                user=request.user, product=product
            )
            if not created:
                fav.delete()  # already favourited → remove it
    return redirect(request.META.get('HTTP_REFERER', 'home'))


# ----------------------
# LOGOUT
# ----------------------

def logout_user(request):
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect('home')


