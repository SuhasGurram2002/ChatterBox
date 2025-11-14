# hashtag_suggester.py - Python Flask API with spaCy NLP

from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from collections import Counter
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load spaCy English model
# Run: python -m spacy download en_core_web_sm
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("Error: spaCy model not found!")
    print("Please run: python -m spacy download en_core_web_sm")
    exit(1)

def clean_hashtag(text):
    """Clean text to be hashtag-friendly"""
    # Remove special characters, keep only alphanumeric
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return cleaned

def extract_keywords(text, max_keywords=5):
    """Extract keywords from text using spaCy NLP"""
    doc = nlp(text)
    
    keywords = []
    
    # Extract named entities (people, organizations, locations, etc.)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    for entity, label in entities:
        cleaned = clean_hashtag(entity)
        if cleaned and len(cleaned) > 2:
            keywords.append((cleaned, 3))  # Higher weight for entities
    
    # Extract important nouns and proper nouns
    nouns = [token.text for token in doc 
             if token.pos_ in ['NOUN', 'PROPN'] 
             and not token.is_stop 
             and len(token.text) > 2]
    
    for noun in nouns:
        cleaned = clean_hashtag(noun)
        if cleaned and len(cleaned) > 2:
            keywords.append((cleaned, 2))
    
    # Extract adjectives (descriptive words)
    adjectives = [token.text for token in doc 
                  if token.pos_ == 'ADJ' 
                  and not token.is_stop 
                  and len(token.text) > 3]
    
    for adj in adjectives:
        cleaned = clean_hashtag(adj)
        if cleaned and len(cleaned) > 3:
            keywords.append((cleaned, 1))
    
    # Extract verbs (action words)
    verbs = [token.lemma_ for token in doc 
             if token.pos_ == 'VERB' 
             and not token.is_stop 
             and len(token.text) > 3]
    
    for verb in verbs:
        cleaned = clean_hashtag(verb)
        if cleaned and len(cleaned) > 3:
            keywords.append((cleaned, 1))
    
    # Count and weight keywords
    keyword_weights = Counter()
    for keyword, weight in keywords:
        keyword_weights[keyword] += weight
    
    # Get top keywords
    top_keywords = [kw for kw, _ in keyword_weights.most_common(max_keywords)]
    
    # If no keywords found, try to extract from compound words
    if not top_keywords:
        words = text.lower().split()
        top_keywords = [clean_hashtag(word) for word in words 
                       if len(clean_hashtag(word)) > 3][:max_keywords]
    
    return top_keywords

def generate_compound_hashtags(text):
    """Generate compound hashtags from multi-word phrases"""
    doc = nlp(text)
    compounds = []
    
    # Extract noun phrases
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) >= 2:  # Multi-word phrases
            compound = ''.join([clean_hashtag(word) for word in chunk.text.split()])
            if compound and len(compound) > 4:
                compounds.append(compound)
    
    return compounds[:2]  # Return top 2 compound hashtags

@app.route('/suggest-hashtags', methods=['POST'])
def suggest_hashtags():
    """API endpoint to suggest hashtags based on post content"""
    try:
        data = request.get_json()
        
        if not data or 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400
        
        content = data['content']
        max_suggestions = data.get('max_suggestions', 5)
        
        if not content or len(content.strip()) == 0:
            return jsonify({'suggestions': []}), 200
        
        # Extract keywords
        keywords = extract_keywords(content, max_keywords=max_suggestions)
        
        # Generate compound hashtags
        compounds = generate_compound_hashtags(content)
        
        # Combine and deduplicate
        all_suggestions = []
        seen = set()
        
        # Add compound hashtags first (they're usually more specific)
        for compound in compounds:
            if compound not in seen and len(all_suggestions) < max_suggestions:
                all_suggestions.append(compound)
                seen.add(compound)
        
        # Add keyword hashtags
        for keyword in keywords:
            if keyword not in seen and len(all_suggestions) < max_suggestions:
                all_suggestions.append(keyword)
                seen.add(keyword)
        
        return jsonify({
            'suggestions': all_suggestions,
            'content': content
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'hashtag-suggester'}), 200

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Detailed text analysis endpoint"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        doc = nlp(content)
        
        analysis = {
            'entities': [{'text': ent.text, 'label': ent.label_} for ent in doc.ents],
            'nouns': [token.text for token in doc if token.pos_ in ['NOUN', 'PROPN']],
            'verbs': [token.lemma_ for token in doc if token.pos_ == 'VERB'],
            'adjectives': [token.text for token in doc if token.pos_ == 'ADJ'],
            'keywords': extract_keywords(content, max_keywords=10),
            'compounds': generate_compound_hashtags(content)
        }
        
        return jsonify(analysis), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Hashtag Suggestion Service...")
    print("spaCy model loaded successfully!")
    print("Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)


# ============================================
# requirements.txt
"""
flask==2.3.2
flask-cors==4.0.0
spacy==3.6.0
"""

# ============================================
# setup_instructions.md
"""
# Setup Instructions for Python NLP Service

## 1. Install Python (if not already installed)
- Download Python 3.8+ from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

## 2. Create a virtual environment (recommended)
```bash
# Navigate to your project directory
cd mini-twitter-nlp

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

## 3. Install dependencies
```bash
pip install flask flask-cors spacy
python -m spacy download en_core_web_sm
```

## 4. Run the service
```bash
python hashtag_suggester.py
```

The service will run on http://localhost:5000

## 5. Test the service
```bash
# Test with curl
curl -X POST http://localhost:5000/suggest-hashtags \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"I love programming in Python and building web applications\"}"

# Expected response:
{
  "suggestions": ["python", "programming", "webapplications", "love", "building"],
  "content": "I love programming in Python and building web applications"
}
```

## API Endpoints

### POST /suggest-hashtags
Suggest hashtags based on post content

**Request:**
```json
{
  "content": "Your post content here",
  "max_suggestions": 5
}
```

**Response:**
```json
{
  "suggestions": ["hashtag1", "hashtag2", "hashtag3"],
  "content": "Your post content here"
}
```

### GET /health
Check if service is running

**Response:**
```json
{
  "status": "healthy",
  "service": "hashtag-suggester"
}
```

### POST /analyze
Get detailed text analysis

**Request:**
```json
{
  "content": "Your post content here"
}
```

**Response:**
```json
{
  "entities": [...],
  "nouns": [...],
  "verbs": [...],
  "adjectives": [...],
  "keywords": [...],
  "compounds": [...]
}
```
"""