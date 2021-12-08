import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Preview, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

const post = {
  content: '<p>post-content</p>', 
  slug: 'my-new-post', 
  title: 'My new post', 
  updatedAt: '08 de dezembro'
};

describe('Preview Post', () => {
  it('renders correctly', async () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Preview post={post} />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('post-content')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  })
  
  it('redirects user to full post when user is subcribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([{
      activeSubscription: 'fake-active-subscription',
    } as any, false]);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Preview post={post} />);

    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
  });

  it('load initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post'}],
          content: [{ type: 'paragraph', text: 'post-content'}],
        },
        last_publication_date: '12-08-2021',
      })
    } as any);

    const response = await getStaticProps({
      params: { slug: 'my-new-post' }
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>post-content</p>',
            updatedAt: '08 de dezembro de 2021',
          }
        }
      })
    )
  });
});
