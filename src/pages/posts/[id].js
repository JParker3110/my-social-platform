import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const fetchPost = async (id) => {
  const { data } = await axios.get(`/api/posts/${id}`);
  return data;
};

const PostDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { data: post, isLoading, error } = useQuery(['post', id], () => fetchPost(id));
  const [commentContent, setCommentContent] = useState('');

  const addCommentMutation = useMutation(
    (newComment) => axios.post(`/api/posts/${id}/comments`, newComment),
    {
      onMutate: async (newComment) => {
        await queryClient.cancelQueries(['post', id]);
        const previousPost = queryClient.getQueryData(['post', id]);
        queryClient.setQueryData(['post', id], (old) => ({
          ...old,
          comments: [...old.comments, { id: Date.now(), ...newComment }],
        }));
        return { previousPost };
      },
      onError: (err, newComment, context) => {
        queryClient.setQueryData(['post', id], context.previousPost);
      },
      onSettled: () => {
        queryClient.invalidateQueries(['post', id]);
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    addCommentMutation.mutate({ content: commentContent });
    setCommentContent('');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading post</div>;

  return (
    <div>
      <h1>{post.content}</h1>
      <ul>
        {post.comments.map((comment) => (
          <li key={comment.id}>
            <p>{comment.content}</p>
            <button>Like</button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <textarea
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Write your comment here..."
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PostDetailsPage;
