# What is this?

A thin shell around npm for installing Python libraries


# Installation

    npm i -g pykg

# Usage

## Add some dependencies

    pykg install requests django

## Run an npm script

NB: Only `npm start` is supported now

    pykg start # equivalent to npm start, with $PYTHONPATH set appropriately


# FAQs

## Why?

To see if it could be done


## No seriously...why?

I like npm. I thought this would be a good way to learn how Python libraries actually get installed.

## Are there any advantages to using this?

* You can take advantage of NPM/yarn features such as local caching for offline installs, lockfiles etc.
* `package.json` is a standard in the NPM-world. `setup.py` and `requirements.txt` fulfill some of the functions but not all


## And?

It can be done
