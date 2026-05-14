from passlib.context import CryptContext
contexto = CryptContext(schemes=["bcrypt"], deprecated="auto")
p = "Admin1234"
print(contexto.hash(p))




1e88d10878ed2eb0802371dd045b9968d25d9ae144a3ac86192bbcfbee6423e5