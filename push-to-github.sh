#!/bin/bash

# Replace 'yourusername' with your GitHub username
# Replace 'ai-quiz-agent' with your repository name if different

echo "Setting up GitHub remote..."
git remote add origin https://github.com/yourusername/ai-quiz-agent.git

echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Your code is now on GitHub."