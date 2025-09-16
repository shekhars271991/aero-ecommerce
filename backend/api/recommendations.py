from flask import request
from flask_restful import Resource
import random


def create_recommendations_resource(db_manager, time_api_call, create_api_response):
    """Factory function to create recommendations resource with initialized dependencies"""
    
    class RecommendationsResource(Resource):
        @time_api_call
        def get(self):
            # Get current database type
            current_db = db_manager.get_current_database()
            
            # Debug logging
            print(f"DEBUG: Current database in recommendations API: {current_db}")
            print(f"DEBUG: Database manager type: {type(db_manager)}")
            print(f"DEBUG: Database manager current_db attribute: {getattr(db_manager, 'current_db', 'NOT_FOUND')}")
            
            # Only provide recommendations for Aerospike database
            if current_db != 'aerospike':
                return create_api_response(
                    None, 
                    False, 
                    f"Recommendations are only available with Aerospike database (current: {current_db})"
                ), 400
            
            # Get user session ID for personalization (future use)
            session_id = request.args.get('session_id', 'default')
            limit = request.args.get('limit', 6, type=int)
            
            # For now, return dummy recommendations
            # In the future, this would use Aerospike's advanced features for:
            # - Real-time user behavior analysis
            # - Collaborative filtering
            # - Content-based recommendations
            # - Cross-sell and upsell suggestions
            
            # Get some products to use as dummy recommendations
            try:
                all_products = db_manager.get_all_products()
                
                if not all_products:
                    return create_api_response([])
                
                # Simulate personalized recommendations by randomly selecting products
                # and adding recommendation reasons
                available_products = all_products[:20]  # Use first 20 products
                recommended_products = random.sample(
                    available_products, 
                    min(limit, len(available_products))
                )
                
                # Add recommendation metadata
                recommendation_reasons = [
                    "Frequently bought together",
                    "Based on your recent purchases",
                    "Popular in your area",
                    "Trending now",
                    "Similar to items you viewed",
                    "Recommended for you",
                    "Best sellers in this category",
                    "Perfect match for your preferences"
                ]
                
                recommendations = []
                for i, product in enumerate(recommended_products):
                    recommendation = {
                        **product,  # Include all product data
                        'recommendation_score': round(random.uniform(0.7, 0.95), 2),
                        'recommendation_reason': random.choice(recommendation_reasons),
                        'recommendation_rank': i + 1
                    }
                    recommendations.append(recommendation)
                
                # Sort by recommendation score (highest first)
                recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
                
                return create_api_response({
                    'recommendations': recommendations,
                    'total_count': len(recommendations),
                    'session_id': session_id,
                    'algorithm': 'aerospike_ml_hybrid',  # Dummy algorithm name
                    'generated_at': db_manager.get_current_timestamp() if hasattr(db_manager, 'get_current_timestamp') else None
                })
                
            except Exception as e:
                return create_api_response(
                    None, 
                    False, 
                    f"Failed to generate recommendations: {str(e)}"
                ), 500
    
    return RecommendationsResource
