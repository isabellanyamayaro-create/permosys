from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    entity_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ("id", "email", "name", "role", "entity", "entity_name", "badge", "initials", "label", "is_active")
        read_only_fields = ("id", "badge", "initials", "label", "entity_name")

    def get_entity_name(self, obj):
        return obj.entity.name if obj.entity else None


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ("email", "name", "role", "entity", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
