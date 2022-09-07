# BulkDL
Bulk downloader.

Original intent was to bulk download URLs from the [internet archive](https://archive.org/download/mame-merged/mame-merged/).

To install: `npm install -g`.

```
Usage: bulkdl [options] <filename>

Arguments:
  filename         text file containing list of URLs

Options:
  -V, --version    output the version number
  -D, --dir <dir>  Destination Directory (default: "downloads")
  -O, --overwrite  Overwrite the file if already exists (default: false)
  -h, --help       display help for command
```

`<filename>` is a text file with a list of URLs, like so:

```
https://url/1
https://url/2
https://url/3
```

You can abbreviate your file if the url is the same by just using including the filename - bulkdl will use the previous url to complete the download. For example, this is equivalent to the above file.

```
https://url/1
2
3
```