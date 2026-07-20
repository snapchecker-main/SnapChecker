from slowapi import Limiter
from slowapi.util import get_remote_address

# This uses the user's IP address to track their request count
limiter = Limiter(key_func=get_remote_address)