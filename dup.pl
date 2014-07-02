#!/usr/bin/perl
use strict;
use open ':utf8';
use JSON;
use CGI;
use DBI;

my $dbh = DBI->connect('dbi:SQLite:dbname=data/log.db','','')
  or error('500 Internal Server Error', 'connect failed');

my $query = CGI->new;
my $call = $query->param('call');
my $band = $query->param('band');
my $mode = $query->param('mode');

my $dup = $dbh->selectrow_arrayref(
  'SELECT * FROM contacts WHERE call=?;', undef,
  $call);
print CGI::header(-type => 'application/json',
                  -charset => 'utf8');
print encode_json($dup or []);
