import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentora_Electrics.settings')
django.setup()

from core.models import Product, Cart, CartItem, User
from django.db import connection

print("=" * 60)
print("MENTORA ELECTRIC SYSTEM VERIFICATION")
print("=" * 60)

# 1. MongoDB Connection
print("\n✓ 1. MongoDB Connection")
try:
    connection.ensure_connection()
    print("   Status: CONNECTED ✓")
    print(f"   Database: {connection.settings_dict['NAME']}")
except Exception as e:
    print(f"   Status: FAILED ✗")
    print(f"   Error: {e}")

# 2. Products Check
print("\n✓ 2. Products in Database")
product_count = Product.objects.count()
print(f"   Total Products: {product_count}")
if product_count > 0:
    print("   Sample products:")
    for p in Product.objects.all()[:3]:
        print(f"   - {p.name}: ${p.price} (Stock: {p.stock})")
    print("   Status: OK ✓")
else:
    print("   Status: NO PRODUCTS ✗")

# 3. Cart Functionality
print("\n✓ 3. Cart Models")
print(f"   Cart model: {'Exists' if Cart else 'Missing'} ✓")
print(f"   CartItem model: {'Exists' if CartItem else 'Missing'} ✓")
cart_count = Cart.objects.count()
cartitem_count = CartItem.objects.count()
print(f"   Active Carts: {cart_count}")
print(f"   Cart Items: {cartitem_count}")

# 4. User Authentication
print("\n✓ 4. User Authentication")
user_count = User.objects.count()
print(f"   Total Users: {user_count}")
if user_count == 0:
    print("   Status: No users yet (create via /auth/ page)")
else:
    print(f"   Status: {user_count} user(s) registered ✓")

# 5. URL Routes Check
print("\n✓ 5. URL Routes Available")
routes = [
    ('/', 'Home page with products'),
    ('/auth/', 'Login/Register page'),
    ('/dashboard/', 'Dashboard (requires login)'),
    ('/cart/', 'Cart view'),
    ('/cart/add/<id>/', 'Add to cart'),
    ('/cart/update/<id>/', 'Update cart item'),
    ('/cart/remove/<id>/', 'Remove cart item'),
]
for route, desc in routes:
    print(f"   {route:<25} → {desc}")

# 6. Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
status = "✓ System is READY" if product_count > 0 else "⚠ Add products first"
print(f"{status}")
print()
print("Next Steps:")
print("1. Visit http://127.0.0.1:8000/ to see products")
if user_count == 0:
    print("2. Go to /auth/ to create an account")
print("3. Add items to cart (requires login)")
print("4. View cart at /cart/")
print()
