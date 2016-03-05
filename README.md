# apm
A realtime process manager to deploy node application

#Setting server
####Install
	sudo npm install apm-server -g
#### Run the server
	apm-server

#Installing Client
	sudo npm install apm-client -g

#Deploy node app
	cd myProject
	apm --server 127.0.0.1
	deploy

This will make a zip of the current folder and send server to deploy.

You can specify your rules by having an `apm.json` file in the project directory. Define your project files to deploy in `src` array

	{
		"server": "127.0.0.1",
		"src":[
			"package.json",
			"*.js",
			"bin/*",
			"models/*",
			"routes/*",
			"utils/*",
			"views/*",
			"controllers/**/*",
			"node_modules/**/*",
			"public/**/*"
		]
	}

Now you can do `deploy` without specifying `--server address`. If you are generating dist of your project you dont have to specify the files. just upload the whole folder.

	cd dist
	apm
	deploy
	
Your app will be deployed in `127.0.0.1:6001`. check your browser if it is running successfully or type `status` on `apm` console. so a simple nginx config would be


	server {
	    listen 80;

	    server_name example.com;

	    location / {
	        proxy_pass http://localhost:6001;
	        proxy_http_version 1.1;
	        proxy_set_header Upgrade $http_upgrade;
	        proxy_set_header Connection 'upgrade';
	        proxy_set_header Host $host;
	        proxy_cache_bypass $http_upgrade;
	    }
	}

# Commands
	$apm --server 127.0.0.1
	>status
	>deploy
