"""
Fernet-based symmetric encryption for storing sensitive credentials at rest.
"""

from cryptography.fernet import Fernet

from app.core.config import settings

_fernet = Fernet(settings.FERNET_SECRET_KEY.encode())


def encrypt_value(plain: str) -> str:
    """Encrypt a plaintext string and return the ciphertext as a UTF-8 string."""
    return _fernet.encrypt(plain.encode()).decode()


def decrypt_value(cipher: str) -> str:
    """Decrypt a ciphertext string back to plaintext."""
    return _fernet.decrypt(cipher.encode()).decode()
