# Sandpiles Simulation Dashboard

An interactive dashboard to visualize sandpile simulations on a 2D grid using Flask and NetworkX.

## Features
- Dynamic graph generation (2D grid).
- Sandpile avalanche simulation logic.
- Real-time visualization using D3.js (frontend).
- Dashboard with controls for graph size and simulation speed.

## Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Sandpiles
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**:
   ```bash
   python server.py
   ```
   Open `http://localhost:5000` in your browser.

## Deployment Instructions

### Deploying to Render (Recommended)

1. **Push your code to GitHub**.
2. **Create a new Web Service on Render**:
   - Connect your GitHub repository.
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
3. **Deploy**! Render will automatically handle the setup and provide a public URL.

### Deploying to Heroku

1. **Install Heroku CLI**.
2. **Create a Heroku app**:
   ```bash
   heroku create sandpiles-simulation
   ```
3. **Push to Heroku**:
   ```bash
   git push heroku main
   ```
   Heroku will use the `Procfile` to start the web service.

## Project Structure
- `server.py`: Flask backend and API endpoints.
- `graph.py`: Graph generation logic using NetworkX.
- `index.html`: Main frontend dashboard structure.
- `style.css`: Visual styling and dashboard layout.
- `graphHandler.js`: Frontend logic for D3.js visualization and API interaction.
