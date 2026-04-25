import spacy
import re
from typing import List, Set

TICKER_RE = re.compile(r'\$([A-Z]{2,10})\b')

# Canonical dictionary: name/alias → ticker symbol
CRYPTO_DICT = {
    "bitcoin": "BTC", "btc": "BTC",
    "ethereum": "ETH", "eth": "ETH", "ether": "ETH",
    "solana": "SOL", "sol": "SOL",
    "cardano": "ADA", "ada": "ADA",
    "xrp": "XRP", "ripple": "XRP",
    "dogecoin": "DOGE", "doge": "DOGE",
    "shiba": "SHIB", "shib": "SHIB", "shiba inu": "SHIB",
    "avalanche": "AVAX", "avax": "AVAX",
    "polkadot": "DOT", "dot": "DOT",
    "chainlink": "LINK", "link": "LINK",
    "polygon": "MATIC", "matic": "MATIC",
    "uniswap": "UNI", "uni": "UNI",
    "litecoin": "LTC", "ltc": "LTC",
    "stellar": "XLM", "xlm": "XLM",
    "cosmos": "ATOM", "atom": "ATOM",
    "near": "NEAR", "near protocol": "NEAR",
    "aptos": "APT", "apt": "APT",
    "arbitrum": "ARB", "arb": "ARB",
    "optimism": "OP",
    "sui": "SUI",
    "pepe": "PEPE",
    "floki": "FLOKI",
}

# Symbols that have legitimate non-crypto usage — require context
AMBIGUOUS = {"LINK", "DOT", "UNI", "OP", "NEAR", "ATOM"}

class NERModel:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_trf")
        print("[NER] spaCy model loaded")

    def extract_coins(self, text: str) -> List[str]:
        found: Set[str] = set()

        # Method 1: $TICKER notation (highest confidence)
        for m in TICKER_RE.finditer(text.upper()):
            found.add(m.group(1))

        # Method 2: Dictionary match on lowercase
        lower = text.lower()
        for alias, symbol in CRYPTO_DICT.items():
            if alias in lower:
                found.add(symbol)

        # Method 3: spaCy NER for ORG/PRODUCT entities
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT"):
                key = ent.text.lower().strip()
                if key in CRYPTO_DICT:
                    found.add(CRYPTO_DICT[key])

        return sorted(found)

    def extract_batch(self, texts: List[str]) -> List[List[str]]:
        return [self.extract_coins(t) for t in texts]