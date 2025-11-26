"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment } from "@/lib/actions/comments";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { SignInButton } from "@clerk/clerk-react";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    twitchUsername: string;
    avatarUrl: string | null;
  };
}

interface CommentSectionProps {
  profileId: string;
  initialComments: Comment[];
  userId?: string;
}

export function CommentSection({
  profileId,
  initialComments,
  userId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const newComment = await createComment({
          settingsProfileId: profileId,
          userId,
          content: content.trim(),
        });
        setComments([newComment, ...comments]);
        setContent("");
        toast.success("Comment posted!");
      } catch (error: any) {
        console.error("Error creating comment:", error);
        toast.error(error.message || "Failed to post comment");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {userId ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !content.trim()}>
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <SignInButton mode="modal">
                <Button variant="link" className="p-0 cursor-pointer">
                  Sign in
                </Button>
              </SignInButton>
              <span className="pl-1">to leave a comment</span>
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage
                    src={comment.user.avatarUrl || undefined}
                    alt={comment.user.twitchUsername}
                  />
                  <AvatarFallback className="bg-secondary text-foreground">
                    {comment.user.twitchUsername.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {comment.user.twitchUsername}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
