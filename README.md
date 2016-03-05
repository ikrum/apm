# APM
A process manager to deploy node application on runtime. Hasslefree `deploy` command to upload your app from your pc.

#Setting server
####Install
	sudo npm install apm-server -g
#### Run the server
	apm-server
#### Port 
APM runs on public port `4785`. So, if your server has restrictions on PORTs (i.e Azure VM) you have to make `4785` port public.

#Installing Client
	sudo npm install apm-client -g

### Client Commands
	$ apm --server localhost	// connect to your remote server, you can define server address in apm.json
	apm:> status				// check server is running or not
	apm:> deploy 				// deploy current folder or files spcified in apm.json
	apm:> restart				// restart your app


#Deploy node app
	cd myProject
	apm --server 127.0.0.1
	deploy

This will make a zip of the current folder and send server to deploy.

You can specify your rules by having an `apm.json` file in the project directory. Define your project files to deploy in `src` array

#### apm.json

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
	
Your app will be deployed in `127.0.0.1:6001`. check your browser if it is running successfully or type `status` on `apm` console. To avoid server down state, apm uses a temporary port `6002` to switch new app. so a simple nginx config would be:

	server {
		listen       80;
		server_name  example1.com;

		location / {
			proxy_pass http://127.0.0.1:6001;
		}
	}

	server {
		listen       80;
		server_name  example2.com;

		location / {
			proxy_pass http://127.0.0.1:6002;
		}
	}

