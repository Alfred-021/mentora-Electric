from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

from core.models import Product


# ----------------------
# HOME & STATIC PAGES
# ----------------------

def home(request):
    products = Product.objects.all()  # Assuming you have a Product model
    return render(request, 'home.html', {'products': products})


def about(request):
    return render(request, 'about.html')


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


# ----------------------
# LOGOUT
# ----------------------

def logout_user(request):
    logout(request)
    messages.success(request, "Logged out successfully")
    return redirect('home')