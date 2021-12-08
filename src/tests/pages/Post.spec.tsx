import { render, screen } from '@testing-library/react';
import { mocked } from 'jest-mock';
import { getSession } from 'next-auth/client';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  content: '<p>post-content</p>', 
  slug: 'my-new-post', 
  title: 'My new post', 
  updatedAt: '08 de dezembro'
};

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post}  />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('post-content')).toBeInTheDocument();
  })

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' }
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: {
          destination: '/posts/preview/my-new-post',
          permanent: false,
        }
      })
    )
  })

  it('load initial data', async () => {
    const getSessionMocked = mocked(getSession);
    const getPrismicClientMocked = mocked(getPrismicClient);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post'}],
          content: [{ type: 'paragraph', text: 'post-content'}],
        },
        last_publication_date: '12-08-2021',
      })
    } as any);

    const response = await getServerSideProps({
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
  })
});