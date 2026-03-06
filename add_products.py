import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mentora_Electrics.settings')
django.setup()

from core.models import Category, Product

# Create categories
categories_data = [
    {'name': 'Cables & Wires', 'slug': 'cables-wires'},
    {'name': 'Switches & Sockets', 'slug': 'switches-sockets'},
    {'name': 'Lighting', 'slug': 'lighting'},
    {'name': 'Circuit Breakers', 'slug': 'circuit-breakers'},
    {'name': 'Tools', 'slug': 'tools'},
]

print("Creating categories...")
for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        slug=cat_data['slug'],
        defaults={'name': cat_data['name']}
    )
    if created:
        print(f"✓ Created: {category.name}")
    else:
        print(f"- Already exists: {category.name}")

# Create products
products_data = [
    {
        'category': 'cables-wires',
        'name': 'Electrical Cable 2.5mm² - 100m Roll',
        'description': 'High-quality copper electrical cable, suitable for domestic and commercial installations.',
        'price': 45.99,
        'stock': 50,
        'is_featured': True,
        'is_new': False,
    },
    {
        'category': 'cables-wires',
        'name': 'Flexible Wire 1.5mm² - 50m',
        'description': 'Multi-strand flexible wire for lighting circuits and low-power applications.',
        'price': 18.50,
        'stock': 100,
        'is_featured': False,
        'is_new': True,
    },
    {
        'category': 'switches-sockets',
        'name': 'Double Wall Socket - White',
        'description': '13A double socket with safety shutters. Modern flat-plate design.',
        'price': 8.99,
        'stock': 200,
        'is_featured': True,
        'is_new': False,
    },
    {
        'category': 'switches-sockets',
        'name': 'Light Switch - 2 Gang',
        'description': 'Two-way light switch, polished chrome finish with black inserts.',
        'price': 12.75,
        'stock': 150,
        'is_featured': False,
        'is_new': False,
    },
    {
        'category': 'lighting',
        'name': 'LED Bulb 9W E27 - Warm White',
        'description': 'Energy-efficient LED bulb, equivalent to 60W incandescent. 806 lumens.',
        'price': 4.25,
        'stock': 500,
        'is_featured': True,
        'is_new': True,
    },
    {
        'category': 'lighting',
        'name': 'LED Downlight 6W - Cool White',
        'description': 'Recessed LED downlight with integrated driver. IP44 rated for bathrooms.',
        'price': 15.99,
        'stock': 80,
        'is_featured': False,
        'is_new': True,
    },
    {
        'category': 'circuit-breakers',
        'name': 'MCB Circuit Breaker 32A Type B',
        'description': 'Single-pole miniature circuit breaker, 6kA breaking capacity.',
        'price': 22.50,
        'stock': 75,
        'is_featured': True,
        'is_new': False,
    },
    {
        'category': 'circuit-breakers',
        'name': 'RCD 30mA 63A Type A',
        'description': 'Residual current device for consumer unit protection. 2-pole.',
        'price': 58.00,
        'stock': 40,
        'is_featured': False,
        'is_new': False,
    },
    {
        'category': 'tools',
        'name': 'Wire Stripper Tool',
        'description': 'Professional wire stripper for cables 0.5-6mm². Automatic adjustment.',
        'price': 16.99,
        'stock': 60,
        'is_featured': False,
        'is_new': True,
    },
    {
        'category': 'tools',
        'name': 'Digital Multimeter',
        'description': 'Auto-ranging digital multimeter with voltage, current, and resistance measurement.',
        'price': 32.50,
        'stock': 45,
        'is_featured': True,
        'is_new': False,
    },
]

print("\nCreating products...")
for prod_data in products_data:
    category = Category.objects.get(slug=prod_data['category'])
    product, created = Product.objects.get_or_create(
        name=prod_data['name'],
        defaults={
            'category': category,
            'description': prod_data['description'],
            'price': prod_data['price'],
            'stock': prod_data['stock'],
            'image': 'products/placeholder.jpg',  # You'll need to add actual images later
            'is_featured': prod_data['is_featured'],
            'is_new': prod_data['is_new'],
        }
    )
    if created:
        print(f"✓ Created: {product.name} - ${product.price}")
    else:
        print(f"- Already exists: {product.name}")

print(f"\n✅ Done! Total products: {Product.objects.count()}")
