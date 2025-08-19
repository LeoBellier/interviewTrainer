import os, argparse, yaml,json, pathlib
from slugify import slugify
from tenacity import retry, stop_after_attempt, wait_exponential
from groq import Groq
from importlib.resources import files

# =============== Configuración básica ===============

api_key = os.environ.get("deepseek_api_key")
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")  # cámbialo si quieres otro
client =client = Groq(api_key=os.environ.get("groq_api_key"))

# =============== JSON Schema para Structured Outputs ===============
def load_text(path): return pathlib.Path(path).read_text(encoding="utf-8")
def load_json(path): return json.loads(load_text(path))

PROBLEMS_SCHEMA = json.loads((files("prompts") / "schema.problem.json").read_text("utf-8"))
SYSTEM_INSTRUCTIONS = (files("prompts") / "system.es-AR.md").read_text("utf-8")
USER_TEMPLATE = (files("prompts") / "user_template.es-AR.md").read_text("utf-8")


def build_prompt(company: str, roles: list[str], count: int, topics: list[str] | None):
    return USER_TEMPLATE.format(
        count=count,
        company=company,
        roles=", ".join(roles),
        topics=", ".join(topics) if topics else "el rol indicado"
    )

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def generate(company: str, roles: list[str], count: int, topics: list[str] | None):
    user_prompt = build_prompt(company, roles, count, topics)

    response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "system", "content": SYSTEM_INSTRUCTIONS},
        {"role": "user", "content": user_prompt},
    ],
    response_format={"type": "json_object"},
    stream=False
    )
    data = response.choices[0].message.content
    jsonData = json.loads(data)
    result = {'company': company, 'questions': jsonData}
    return result

def write_company_yaml(payload: dict, out_dir: str):
    company = payload["company"]
    slug = slugify(company)
    path = os.path.join(out_dir, f"{slug}.yaml")

    # Asegurar campos de cabecera
    header = {
        "company": company,
        "slug": slug,
        "roles": payload.get("roles", []),
        "locale_support": payload.get("locale_support", ["es", "en"]),
        "questions": payload.get("questions", [])
    }

    os.makedirs(out_dir, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(header, f, sort_keys=False, allow_unicode=True, width=1000)
    return path

def main():
    parser = argparse.ArgumentParser(description="Genera YAML de ejercicios vía OpenAI")
    parser.add_argument("--company", required=True, help="Nombre de la empresa (ej: Google)")
    parser.add_argument("--roles", nargs="+", default=["Data Engineer"], help="Roles objetivo")
    parser.add_argument("--count", type=int, default=8, help="Cantidad de ejercicios")
    parser.add_argument("--topics", nargs="*", default=None, help="Temas preferidos (opcional)")
    parser.add_argument("--out", default="data/companies", help="Directorio de salida")
    args = parser.parse_args()

    payload = generate(args.company, args.roles, args.count, args.topics)
    out_path = write_company_yaml(payload, args.out)
    print(f"✅ YAML generado: {out_path}")

if __name__ == "__main__":
    main()
