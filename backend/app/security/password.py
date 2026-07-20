from pwdlib import PasswordHash

# Argon2 is the recommended modern password hashing algorithm.
password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using Argon2.
    """
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against its stored hash.
    """
    return password_hash.verify(password, hashed_password)