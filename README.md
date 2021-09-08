# MongoDB Node Script Runner

Write and run custom scripts for your mongoDB using nodeJS.

---

## Install

    $ git clone https://github.com/ifatoki/mongo_scripts
    $ cd mongo_scripts
    $ npm install

## Configuration

1. Create a copy of the **.env.sample** file in the project and name it **.env**.

2. Replace the default `MONGO_URI` with the mongo server you want to connect to.

3. Replace the default `DB_NAME` with the name of the DB you would like to run the script on.

## Running a script

1. Replace the value in the `SCRIPT_NAME` field in the **.env** file with the filename of the script (already existing in the **custom_scripts** folder).

2. Run `npm run start`

## Setting up a new script

1. In the **custom_scripts** dir, copy the file **script_template.js** and create a copy of it, naming it as you wish (note, this name is what you'd use to reference it in the **.env** file).

2. Write your script logic below the line ```// Write your script here```

3. When done, run it as directed above in the *Running a script* section
