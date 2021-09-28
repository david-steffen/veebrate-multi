vertx-dev:
	vertx run src/main/java/veebrate/App.java --redeploy="**/*.java" --launcher-class=io.vertx.core.Launcher

vertx-build:
	npm --prefix frontends/lit-html run build
	mkdir backends/src/main/resources/webroot/css
	cp -r frontends/webfonts backends/vertx/src/main/resources/webroot/webfonts
	sassc --style compressed frontends/scss/main.scss > backends/src/main/resources/webroot/css/main.css
	./gradlew build

django-dev:
	cd backends/django; python manage.py runserver

django-frontend-build:
	rm -r backends/django/apps/veebrate/static/veebrate
	cd frontends/elm; elm make src/Main.elm --optimize --output=../../backends/django/apps/veebrate/static/veebrate/main.js; cd ../..
	mkdir backends/django/apps/veebrate/static/veebrate/css/
	sassc --style compressed frontends/scss/main.scss > backends/django/apps/veebrate/static/veebrate/css/main.css
	cp -r frontends/webfonts backends/django/apps/veebrate/static/veebrate/webfonts

django-build:
	make django-frontend-build
	cd backends/django; python manage.py collectstatic --noinput; cd ../..

sass-dev:
	sassc src/main/scss/main.scss > src/main/resources/webroot/css/main.css
