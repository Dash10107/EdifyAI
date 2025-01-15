'use client';

import { useEffect, useState, useRef } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { db } from '@/configs/db';
import { forumTopics, forumReplies } from '@/db/schema/chapter';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, MessageCircle } from 'lucide-react';

type ForumProps = {
  params: { courseId: string };
};

type Topic = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
};

type Reply = {
  id: string;
  topicId: string;
  userId: string;
  content: string;
  createdAt: Date;
};

export default function Forum({ params }: ForumProps) {
  const { user } = useKindeBrowserClient();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const { toast } = useToast();
  const socketRef = useRef<ReturnType<typeof io>>();
  const replyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTopics();
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socketRef.current = io();

    socketRef.current.on('receive-message', (message: Reply) => {
      setReplies((prevReplies) => [...prevReplies, message]);
    });
  };

  const fetchTopics = async () => {
    const result = await db
      .select()
      .from(forumTopics)
      .where(eq(forumTopics.courseId, params.courseId))
      .orderBy(forumTopics.createdAt);
    setTopics(result as Topic[]);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Please log in to create a topic', variant: 'destructive' });
      return;
    }
    await db.insert(forumTopics).values({
      courseId: params.courseId,
      userId: user.given_name,
      title: newTopic.title,
      content: newTopic.content,
    });
    setNewTopic({ title: '', content: '' });
    setIsCreatingTopic(false);
    fetchTopics();
    toast({ title: 'Topic created successfully' });
  };

  const handleViewReplies = async (topic: Topic) => {
    setSelectedTopic(topic);
    const result = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.topicId, topic.id))
      .orderBy(forumReplies.createdAt);
    setReplies(result as Reply[]);
    socketRef.current?.emit('join-room', topic.id);
  };

  const handleSendReply = async () => {
    if (!user || !selectedTopic) {
      toast({ title: 'Please log in to reply', variant: 'destructive' });
      return;
    }
    const reply = {
      topicId: selectedTopic.id,
      userId: user.given_name,
      content: newReply,
      createdAt: new Date(),
    };
    await db.insert(forumReplies).values(reply);
    socketRef.current?.emit('send-message', { ...reply, roomId: selectedTopic.id });
    setNewReply('');
    setReplies([...replies, reply as Reply]);
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Course Forum</h1>
      <div className="flex-grow flex space-x-4 overflow-hidden">
        <Card className="w-1/3 flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Topics
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingTopic(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                New Topic
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              <AnimatePresence>
                {isCreatingTopic && (
                  <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleCreateTopic}
                    className="space-y-4 mb-4"
                  >
                    <Input
                      placeholder="Topic Title"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      required
                    />
                    <Textarea
                      placeholder="Topic Content"
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      required
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreatingTopic(false)}>Cancel</Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
              {topics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left mb-2"
                    onClick={() => handleViewReplies(topic)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {topic.title}
                  </Button>
                </motion.div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>{selectedTopic ? selectedTopic.title : 'Select a topic'}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <AnimatePresence>
                {selectedTopic && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <p>{selectedTopic.content}</p>
                      </CardContent>
                    </Card>
                    <Separator />
                    {replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start space-x-4"
                      >
                        <Avatar>
                          {/* <AvatarImage src={user?.picture} /> */}
                          <AvatarFallback>{reply?.userId?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <p className="font-semibold">{reply?.userId}</p>
                          <p>{reply.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
          {selectedTopic && (
            <CardFooter>
              <form onSubmit={(e) => { e.preventDefault(); handleSendReply(); }} className="flex w-full space-x-2">
                <Input
                  placeholder="Type your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  ref={replyInputRef}
                />
                <Button type="submit">Send</Button>
              </form>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}