"""
URL configuration for mentora_Electrics project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from core import views

urlpatterns = [
   path("", views.home, name="home"),
   path("about/", views.about, name="about"),
   path("auth/", views.auth_page, name="auth"),

   path('register/', views.register_user, name='register'),
   path('login/', views.login_user, name='login'),
   path('logout/', views.logout_user, name='logout'),
   path("dashboard/", views.dashboard, name="dashboard"),
]
    
