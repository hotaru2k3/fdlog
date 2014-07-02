#!/usr/bin/perl

use strict;
use open ':utf8';
use Fcntl ':flock';
use JSON;
use CGI;
use DBI;

my $dbh = DBI->connect('dbi:SQLite:dbname=data/log.db','','')
  or error('500 Internal Server Error', 'connect failed');
$dbh->do('CREATE TABLE IF NOT EXISTS contacts' .
         ' (call TEXT NOT NULL,' .
         '  band TEXT NOT NULL,' .
         '  mode TEXT NOT NULL,' .
         '  class TEXT NOT NULL,' .
         '  section TEXT NOT NULL,' .
         '  time INTEGER NOT NULL,' .
         '  operator TEXT NOT NULL,' .
         '  logger TEXT NOT NULL,' .
         '  PRIMARY KEY (call, band, mode));'
        ) or error('500 Internal Server Error', 'CREATE TABLE failed');

my $query = CGI->new;
if($query->request_method() == 'POST') {
  my $call = $query->param('call')
     or error('400 Bad Request', 'call is empty');
  my $band = $query->param('band')
     or error('400 Bad Request', 'band is empty');
  my $mode = $query->param('mode')
     or error('400 Bad Request', 'mode is empty');
  my $class = $query->param('class')
     or error('400 Bad Request', 'class is empty');
  error('400 Bad Request', 'invalid class') unless $class =~ /^\d+([ABCDEF]|AB|BB)$/;
  my $section = $query->param('section')
     or error('400 Bad Request', 'section is empty');
  my $time = time;
  my $operator = $query->param('operator');
  my $logger = $query->param('logger');

  $dbh->do('INSERT INTO contacts VALUES(?,?,?,?,?,?,?,?);', undef,
    $call, $band, $mode, $class, $section, $time, $operator, $logger)
    or error('500 Internal Server Error', 'INSERT failed');
}

my $sections_worked = $dbh->selectall_arrayref(
  'SELECT DISTINCT section FROM contacts;');
my $last20 = $dbh->selectall_arrayref(
  'SELECT * FROM contacts ORDER BY time DESC LIMIT 20;');
my $status = encode_json({
  'sections_worked' => $sections_worked, 'last20' => $last20});
open my $statusfile, '>', 'data/status.json';
flock $statusfile, LOCK_EX;
print $statusfile $status;
flock $statusfile, LOCK_UN;
close $statusfile;
print CGI::header(-type => 'application/json',
                  -charset => 'utf8');
print $status;

sub error($$)
{
   my ($status, $message) = @_;
   print CGI::header(-type => 'application/json',
                     -status => $status,
                     -charset => 'utf-8');
   print encode_json({'msg' => $message});
   exit;
}
