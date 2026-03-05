from django.db import models
from django.contrib.auth.models import User


# ----------------------
# CATEGORY MODEL
# ----------------------
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


# ----------------------
# PRODUCT MODEL
# ----------------------
class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    image = models.ImageField(upload_to='products/')
    is_featured = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ----------------------
# FAVORITES
# ----------------------
class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


# ----------------------
# CART
# ----------------------
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}'s Cart"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.product.price * self.quantity


# ----------------------
# ORDER
# ----------------------
class Order(models.Model):

    PAYMENT_CHOICES = (
        ('delivery', 'Payment on Delivery'),
        ('upfront', 'Upfront Payment'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
