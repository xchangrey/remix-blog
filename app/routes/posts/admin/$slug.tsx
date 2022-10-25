import { marked } from 'marked';
import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData, useActionData, useTransition } from '@remix-run/react';
import invariant from 'tiny-invariant';
import type { ActionFunction } from '@remix-run/node';

import { editPost, getPost, Post } from '~/models/post.server';

type LoaderData = { 
  post: Post;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);

  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

type ActionData = 
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

const inputClass = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export const action: ActionFunction = async ({ request, }) => {
  const formData = await request.formData();

  const title = formData.get('title');
  const slug = formData.get('slug');
  const markdown = formData.get('markdown');
  const errors: ActionData = {
    title: title ? null : 'Title is required',
    slug: slug ? null : 'Slug is required',
    markdown: markdown ? null : 'Markdown is required',
  };

  const hasErors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErors){
    return json<ActionData>(errors);
  }

  invariant(
    typeof title === 'string',
    "title must be a string"
  );
  invariant(
    typeof slug === 'string',
    "slug must be a string"
  );
  invariant(
    typeof markdown === 'string',
    "markdown must be a string"
  );

  await editPost({ title, slug, markdown })

  return redirect("/posts/admin");
}

export default function PostSlug(){
  const { post } = useLoaderData() as LoaderData;
  const errors = useActionData();
  const transition = useTransition();
  const isEditing = Boolean(transition.submission);

  return (
    <Form method='post'>
      <p>
        <label>
          Post Title: {" "}
          {errors?.title ? (
            <em className='text-red-600'>{errors.title}</em>
          ): null}
          <input
            type="text"
            name="title"
            className={inputClass}
            value={post.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {" "}
          {errors?.slug ? (
            <em className='text-red-600'>{errors.slug}</em>
          ): null}
          <input 
            type="text"
            name="slug"
            className={inputClass}
            value={post.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor='markdown'>
          Markdown: {" "}
          {errors?.markdown ? (
            <em className='text-red-600'>{errors.markdown}</em>
          ): null}
        </label>
        <br/>
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClass} font-mono`}
          >
            {post.markdown}
          </textarea>
      </p>
      <p className='text-right'>
        <button
          type="submit"
          className='rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300'
          disabled={isEditing}
        >
          {isEditing ? 'Editing...':'Edit'}
        </button>
      </p>
    </Form>
  )
}