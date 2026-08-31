from fastapi import FastAPI


app = FastAPI(title="Post-Disaster Building Assessment API")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Report that the application is running."""
    return {"status": "ok"}
