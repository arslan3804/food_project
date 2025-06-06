# Generated by Django 3.2.16 on 2025-05-17 21:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0002_auto_20250518_0008'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='productimage',
            name='alt_text',
        ),
        migrations.AddField(
            model_name='product',
            name='average_rating',
            field=models.FloatField(default=0.0),
        ),
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('в обработке', 'В обработке'), ('подтвержден', 'Подтвержден'), ('в пути', 'В пути'), ('доставлен', 'Доставлен'), ('отменен', 'Отменен')], default='pending', max_length=20),
        ),
    ]
