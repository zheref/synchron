
var diffman = function() {
    var mongodb = require('mongodb'),
        mysql = require('mysql'),
        utils = require('util'),
        underscore = require('underscore'),
        MongoClient = mongodb.MongoClient,
        MySqlClient, MongoClientDB,
        mongids = [],
        mysqlids = [],
        mongoSyncMysql = [],
        mysqlSyncMongo = [];

    function mongoCheck(afterthat){
        MongoClient.connect("mongodb://127.0.0.1:27017/wiwdb", function(error, db) {
            MongoClientDB = db;

            if (error) {
                throw error;
            }

            var gifts = MongoClientDB.collection('gifts');

            gifts.find(null, ['id']).toArray(function(error, results) {
                console.dir(results);

                for (var i = 0; i < results.length; i++) {
                    mongids.push(results[i]['id']);
                }

                afterthat();
            });
        });
    }

    function mysqlCheck(afterthat) {
        MySqlClient = mysql.createConnection({
            host: "127.0.0.1",
            user: "root",
            password: "",
            database: "wiwdb",
            port: "3306"
        });

        MySqlClient.connect();

        MySqlClient.query("SELECT id FROM gifts", function(error, results, fields) {
            if (error) {
                throw error;
            }

            console.dir(results);

            for (var i = 0; i < results.length; i++) {
                mysqlids.push(results[i]['id']);
            }

            afterthat();
        });
    }

    mongoCheck(function() {
        mysqlCheck(function() {
            console.log("MongoDB ids: " + mongids.join(", "));
            console.log("MySQL ids: " + mysqlids.join(", "));

            mysqlSyncMongo = underscore.difference(mysqlids, mongids);
            mongoSyncMysql = underscore.difference(mongids, mysqlids);

            console.log("To sync from MySQL to MongoDB: " + mysqlSyncMongo.join(", "));
            console.log("To sync from MongoDB to MySQL: " + mongoSyncMysql.join(", "));

            retrieveMySQLDataToSyncToMongo(mysqlSyncMongo, function() {
                retrieveMongoDBDataToSyncToMySQL(mongoSyncMysql, function() {
                    MySqlClient.end();
                    MongoClientDB.close();
                });
            });
        });
    });

    function retrieveMySQLDataToSyncToMongo(keys, atFinalizar) {
        if (keys.length > 0) {
            var consulta = "SELECT * FROM gifts WHERE id = " + keys.join(" OR id = ");
            console.log("Going to retrieve: ");
            console.dir(consulta);

            MySqlClient.query(consulta, function(error, results) {
                if (error) {
                    throw error;
                }

                console.log("RECORDS TO SYNC FROM MYSQL TO MONGODB:");
                console.dir(results);

                var gifts = MongoClientDB.collection('gifts');
                console.log("SYNCING FROM MYSQL TO MONGODB...");
                gifts.insert(results, {safe: true}, function(error, objects) {
                    if (error) {
                        throw error;
                    }
                    atFinalizar();
                });
            });
        } else {
            console.log("No data to sync from MySQL to MongoDB");
            atFinalizar();
        }
    }

    function getConsultaInsercion(colect) {
        var strs = [];

        for (var i = 0; i < colect.length; i++) {
            var obj = colect[i];
            strs.push("('" + obj.id + "', '" + obj.description + "', '" + obj.price + "', '" + obj.currency + "')");
        }

        return "INSERT INTO `wiwdb`.`gifts` (`id`, `description`, `price`, `currency`) VALUES " + strs.join(", ");
    }

    function retrieveMongoDBDataToSyncToMySQL(keys, atFinalizar) {
        if (keys.length > 0) {
            var gifts = MongoClientDB.collection('gifts');
            var or = [];

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                or.push({ id: key });
            }

            var consulta = { $or: or };
            console.log("Going to retrieve: " + consulta);

            gifts.find(consulta).toArray(function(error, results) {
                console.log("RECORDS TO SYNC FROM MONGODB TO MYSQL:");
                console.dir(results);

                var insercion = getConsultaInsercion(results);
                console.log("Insercion: " + insercion);

                MySqlClient.query(insercion, function(error, results) {
                    if (error) {
                        throw error;
                    }

                    atFinalizar();
                });
            });

        } else {
            console.log("No data to sync from MongoDB to MySQL");
            atFinalizar();
        }
    }

    function insertRecord() {
        var record = {
            'id': 2,
            'description': "Samsung Galaxy Note 10.1 2014 Edition",
            'price': "550",
            'currency': "dollar"
        };
    }
};

module.exports = diffman;