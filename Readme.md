# What is this?

A thin shell around npm for installing Python libraries


# Installation

    npm i -g pykg

# Usage

## Initialize your `package.json`

    # Inside your new project's directory root
    npm init

or if you prefer `yarn`

    yarn init

## Add some dependencies

    pykg install requests django

## Run an [npm script](https://docs.npmjs.com/misc/scripts)

NB: Only `npm start` is supported now

    pykg start # equivalent to npm start, with $PYTHONPATH set appropriately


# Known limitations

* Doesn't support libraries with native extensions
* I only have 7 Python libraries up on the [NPM registry](https://www.npmjs.com/org/pypi) so far
* Doesn't do dependency resolution from `requirements.txt`
* Doesn't add scripts from libraries to your `PATH`


# FAQs

## Why?

To see if it could be done



## No seriously...why?

I like npm/yarn. I thought this would be a good way to learn how Python libraries actually get installed.



## Are there any advantages to using this?

* You can take advantage of NPM/yarn features such as local caching for offline installs, lockfiles etc.
* `package.json` is a standard in the NPM-world. `setup.py` and `requirements.txt` fulfill some of the functions but not all
* You don't need virtualenv. npm/yarn installs dependencies into `node_modules` by default and `pykg` sets the `PYTHONPATH` so that imports just work when invoking `package.json` scripts
