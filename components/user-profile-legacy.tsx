import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UserProfile({ user }: { user: any }) {
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No User Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User data is currently unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = user.pseudonym || (user.user ? `${user.user.slice(0, 6)}...${user.user.slice(-4)}` : 'Unknown User');
  const fallback = displayName?.[0]?.toUpperCase() ?? "U";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle>{displayName}</CardTitle>
          {user.user && <p className="text-sm text-muted-foreground">{`${user.user.slice(0, 6)}...${user.user.slice(-4)}`}</p>}
        </div>
        <Badge className="ml-auto">Pro</Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-1">
          <p className="text-sm font-medium">Total Volume</p>
          <p className="text-2xl font-bold">${user.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium">Total Trades</p>
          <p className="text-2xl font-bold">{user.tradeCount}</p>
        </div>
        <Button className="w-full">View Full Portfolio</Button>
      </CardContent>
    </Card>
  );
}
