# k8s-pgbot

a CLI tool to help automate postgres admin tasks in Kubernetes via jobs.

Currently focused on automated backup and restore.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]

## CLI commands

Commands are very simplistic as the configuration is driven from environment variables to simplify setup for running as Kubernetes jobs.

### backup

```shell
pgbot backup
```

 * run `pg_dump` with `tar` and `serializable-deferrable` 
 * gzip `archive.dump` 
 * ensure bucket life-cycle limits match settings
 * uploaded to the specified bucket

> IMPORTANT: to preserve more backups in the event you want to rollback to a more granular point in time, you should specify a granular enough file format via `FILE_NAME_FORMAT` - the default only appends the date.

### restore

```shell
pgbot restore
```

 * determines the latest file in the bucket
 * downloads and unzips contents 
 * runs `pg_restore` on the dump file

You can change the behavior to get it to restore a specific archive file in the bucket by supplying a filename to `FILE_NAME`.

## Environment

All configuration is controlled via environment variables.

### Postgres Connection

 * `POSTGRES_HOST` - defaults to
 * `POSTGRES_PORT` - defaults to 
 * `POSTGRES_DATABASE` - defaults to 
 * `POSTGRES_USERNAME` - defaults to
 * `POSTGRES_PASSWORD` - defaults to

### Object Storage

 * `OBJECT_STORE` - the object store where tasks and grafs are stored and retrieved from
 * `FILE_NAME_FORMAT` - uses templating to specify a pattern for creating tarball names. Tokens are escaped with `<%=` `%>`.
    * All dates and times for tokens are UTC
      * `dateTime` - provides date and time: `mm_dd_yy_HH_MM_SS`
      * `date` - provides date: `mm_dd_yy`
      * `time` - provides time: `HH_MM_SS`
 * `FILE_PATTERNS` - a comma delimited list of glob patterns to tar when creating a backup. defaults to `**/*`
 * `BASE_PATH` - defaults to the processes' path
 * `DATA_PATH` - a subfolder off the base path, defaults to `archive`
 * `FILE_NAME` - a default archive name to use when restoring rather than finding the most recent. Useful in cases where you want to restore from a known archive. 

AWS:

 * `AWS_ACCESS_KEY_ID`
 * `AWS_SECRET_ACCESS_KEY`

GS:

 * `GS_PROJECT_ID`
 * `GS_USER_ID`
 * `GS_USER_KEY`

### Lifecycle Limitations

 * `DISCARD_AFTER` - how many days to keep archives for before removing them
 * `COLDLINE_AFTER` - how many days before a file is moved to "cold storage" this is primarily offerred as a way to move unliked files into a cheaper tier of slower/low priority storage.

## Docker Image

Docker image is already built and published to `npmwharf/k8s-pgbot` uses the `pgbot` command as the entrypoint.

[travis-url]: https://travis-ci.org/npm-wharf/k8s-pgbot
[travis-image]: https://travis-ci.org/npm-wharf/k8s-pgbot.svg?branch=master
[coveralls-url]: https://coveralls.io/github/npm-wharf/k8s-pgbot?branch=master
[coveralls-image]: https://coveralls.io/repos/github/npm-wharf/k8s-pgbot/badge.svg?branch=master
