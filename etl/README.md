# dbmigrate

```shell
./dbmigrate

# dbmigrate [path/to/database.sqlite] [path/to/migrations] [target_version] [second_target_version]

# The second target will be migrated to after a successful migration to the first target.
# This can be used to re-run a migration after it has been modified.
```