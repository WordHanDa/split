from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS for cross-origin support
import pymysql
import logging
from datetime import datetime

# Replace mysqlclient with pymysql
pymysql.install_as_MySQLdb()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app and database
db = SQLAlchemy()
app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Database configuration
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:123456@localhost/split_test"
db.init_app(app)

# Define the GetProfile model to match your database table
class GetProfile(db.Model):
    __tablename__ = 'GetProfile'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    UserID = db.Column(db.String(255), unique=True, nullable=False)
    DisplayName = db.Column(db.String(255), nullable=True)
    PictureURL = db.Column(db.String(1024), nullable=True)
    StatusMessage = db.Column(db.String(500), nullable=True)
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)
    UpdatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "UserID": self.UserID,
            "DisplayName": self.DisplayName,
            "PictureURL": self.PictureURL,
            "StatusMessage": self.StatusMessage,
            "CreatedAt": self.CreatedAt.isoformat() if self.CreatedAt else None,
            "UpdatedAt": self.UpdatedAt.isoformat() if self.UpdatedAt else None
        }

# Route to get all profiles
@app.route('/api/profiles', methods=['GET'])
def get_all_profiles():
    try:
        profiles = GetProfile.query.all()
        return jsonify([profile.to_dict() for profile in profiles])
    except Exception as e:
        logger.error(f"Database error in get_all_profiles: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route to get a specific profile by LINE UserID
@app.route('/api/profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    try:
        profile = GetProfile.query.filter_by(UserID=user_id).first()
        if profile:
            return jsonify(profile.to_dict())
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        logger.error(f"Database error in get_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route to create or update a profile
@app.route('/api/profile', methods=['POST'])
def save_profile():
    try:
        # Get data from request
        data = request.json
        logger.debug(f"Received profile data: {data}")
        
        # Validate required field
        if 'userId' not in data:
            return jsonify({'error': 'userId is required'}), 400
        
        # Check if profile already exists
        profile = GetProfile.query.filter_by(UserID=data['userId']).first()
        
        if profile:
            # Update existing profile
            profile.DisplayName = data.get('displayName', profile.DisplayName)
            profile.PictureURL = data.get('pictureUrl', profile.PictureURL)
            profile.StatusMessage = data.get('statusMessage', profile.StatusMessage)
            profile.UpdatedAt = datetime.utcnow()
            db.session.commit()
            logger.info(f"Updated profile for user: {data['userId']}")
            return jsonify({'message': 'Profile updated successfully', 'profile': profile.to_dict()})
        else:
            # Create new profile
            new_profile = GetProfile(
                UserID=data['userId'],
                DisplayName=data.get('displayName'),
                PictureURL=data.get('pictureUrl'),
                StatusMessage=data.get('statusMessage')
            )
            db.session.add(new_profile)
            db.session.commit()
            logger.info(f"Created new profile for user: {data['userId']}")
            return jsonify({'message': 'Profile created successfully', 'profile': new_profile.to_dict()}), 201
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error in save_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Batch insert profiles (for bulk operations)
@app.route('/api/profiles/batch', methods=['POST'])
def batch_profiles():
    try:
        # Get data from request
        profiles_data = request.json
        logger.debug(f"Received batch profile data: {profiles_data}")
        
        # Validate data format
        if not isinstance(profiles_data, list):
            return jsonify({'error': 'Request body must be an array of profiles'}), 400
        
        results = []
        for data in profiles_data:
            # Check required field
            if 'UserID' not in data:
                results.append({'error': 'UserID is required', 'data': data})
                continue
                
            # Check if profile exists
            profile = GetProfile.query.filter_by(UserID=data['UserID']).first()
            
            if profile:
                # Update existing profile
                profile.DisplayName = data.get('DisplayName', profile.DisplayName)
                profile.PictureURL = data.get('PictureURL', profile.PictureURL)
                profile.StatusMessage = data.get('StatusMessage', profile.StatusMessage)
                profile.UpdatedAt = datetime.utcnow()
                results.append({'status': 'updated', 'profile': profile.to_dict()})
            else:
                # Create new profile
                new_profile = GetProfile(
                    UserID=data['UserID'],
                    DisplayName=data.get('DisplayName'),
                    PictureURL=data.get('PictureURL'),
                    StatusMessage=data.get('StatusMessage', '')
                )
                db.session.add(new_profile)
                results.append({'status': 'created', 'profile': {
                    'UserID': new_profile.UserID,
                    'DisplayName': new_profile.DisplayName,
                    'PictureURL': new_profile.PictureURL
                }})
        
        db.session.commit()
        logger.info(f"Batch processed {len(profiles_data)} profiles")
        return jsonify(results)
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error in batch_profiles: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Raw SQL example (as in your original code)
@app.route('/selectAll', methods=['GET'])
def index():
    try:
        with db.engine.connect() as connection:
            sql_cmd = """
            SELECT *
            FROM GetProfile
            """
            result = connection.execute(db.text(sql_cmd))
            results = [dict(row._mapping) for row in result]
            return jsonify(results)
    except Exception as e:
        logger.error(f"Database error in selectAll: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Change the last line of your db.py file
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)  # Use port 5001 instead of 5000