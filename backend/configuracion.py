from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@localhost:3306/scrum_ips")
JWT_SECRET: str = os.getenv("JWT_SECRET", "secreto_desarrollo")
JWT_EXPIRA_MINUTOS: int = int(os.getenv("JWT_EXPIRA_MINUTOS", "480"))
CORS_ORIGENES: list[str] = os.getenv("CORS_ORIGENES", "http://localhost:5173").split(",")
