# Load .env file
export $(cat .env | grep -v ^# | xargs)

# Ensure right permissions in project
echo "We need password to set permissions to write in local, just in case"
sudo chmod -R 777 .

# Start docker containers
docker compose -f docker-compose.yml -f docker-compose-local.yml  up -d

# Install composer packages on container
docker exec -it osi-chess composer install

# Install npm packages
echo "Installing npm packages"
docker exec -it osi-chess npm install

# Compile assets
echo "Compiling assets"
docker exec -it osi-chess npm run watch

