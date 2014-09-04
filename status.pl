#!/usr/bin/perl
use strict;
use open ':utf8';
use CGI;
use Linux::Inotify2;
use Fcntl ':flock';

BEGIN { $| = 1; }

my @stat;
my $filename = 'data/status.json';
my $query = CGI->new;

print CGI::header(-type => 'text/event-stream',
                  -charset => 'UTF-8',
                  -cache_control => 'no-cache');
print "retry: 0\n";
my $last_id = $query->http('Last-Event-ID') or $query->https('Last-Event-ID');
@stat = stat($filename);
while(1)
{ if($last_id == $stat[9])
  { my $inotify = new Linux::Inotify2();
    $inotify->watch($filename, IN_CLOSE_WRITE);
    my @events = $inotify->read(); }
  open my $status, '<', $filename;
  flock $status, LOCK_SH;
  @stat = stat($status);
  print "id: $stat[9]\n";
  for my $line (<$status>)
  { chomp $line;
    print "data:$line\n"; }
  flock $status, LOCK_UN;
  close $status;
  print "\n"; }
