# The submodule path
MATHQUILL = ./vendor/mathquill_custom/
# All of the built assets are in the build folder
MATHQUILL_BUILD = ./vendor/mathquill_custom/build

# All of the files that are moved into the main project
RES = ./tinymce/
RES_JS = ${RES}/js/mathquill.min.js
RES_CSS = ${RES}/css/mathquill.css
RES_FONT = ${RES}/css/font

# Deploy file name
DEPLOY_NAME = matheditor.zip

all: ${RES_JS} ${RES_CSS} ${RES_FONT}

# Copy the JS file
${RES_JS}: ${MATHQUILL_BUILD}/mathquill.js
	cp ${MATHQUILL_BUILD}/mathquill.js ${RES_JS}

# Copy the CSS file
${RES_CSS}:  ${MATHQUILL_BUILD}/mathquill.css
	cp ${MATHQUILL_BUILD}/mathquill.css ${RES_CSS}

# Copy the fonts
${RES_FONT}: ${MATHQUILL_BUILD}/font
	cp -r ${MATHQUILL_BUILD}/font ${RES_FONT}

# Build dependency, watches the src folder for changes
${MATHQUILL_BUILD}/mathquill.js: ${MATHQUILL}/src/css/* ${MATHQUILL}/src/* 
	make -C ${MATHQUILL}

# Creates a zip file ready for deployment
deploy:
	make clean
	make all
	zip -r ${DEPLOY_NAME} lang/* pix/* tinymce/* lib.php matheditor.php version.php

clean:
	make -C ${MATHQUILL} clean
	rm -f ${RES_JS}
	rm -f ${RES_CSS}
	rm -f -r ${RES}/css/font
	rm -f ${DEPLOY_NAME}
