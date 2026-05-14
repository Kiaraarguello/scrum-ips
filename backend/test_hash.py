from passlib.context import CryptContext
contexto = CryptContext(schemes=["bcrypt"], deprecated="auto")
h = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgC5bHMNnGJVt5xpDmJZ2G"
p = "Admin1234"
print(f"Match: {contexto.verify(p, h)}")
