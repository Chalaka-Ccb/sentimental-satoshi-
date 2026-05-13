from transformers import AutoTokenizer, AutoModelForSequenceClassification

model_name = "ProsusAI/finbert"
save_path = "./models/finbert"

print(f"📡 Starting download for {model_name}...")

# This downloads the 'brain' of the AI
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# This saves it into your local folder
tokenizer.save_pretrained(save_path)
model.save_pretrained(save_path)

print(f"✅ Model successfully saved to {save_path}")