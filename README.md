#felicity-ql
Description of this hapi plugin

## Download

#### How to install this Plugin
```Text
npm install --save felicity-ql
```

## Usage
```Javascript
//Some sort of quick example on how to initialize and use the module
```

## Available Entry-points


# Development Usage

## Install Dependencies
Install the dependencies for this project and create shrinkwrap.
```Text
make clean
```

Install the dependencies based on package.json or shrinkwrap.
```Text
make install
```

## Test Project
Run tests inside your container (This should be uses)
```Text
make run
```

Run mocha test locally.
```Text
make test
```

Both methods create ca coverage report after executing

## Debug Project
Run tests in debug mode.  Allows interactive debug from Webstorm.
```Text
make debug-test
```

Run tests in debug mode inside of Docker.  Allows interactive debug from Webstorm with container port 5858 opened.
 ```Text
 make run-debug test
 ```