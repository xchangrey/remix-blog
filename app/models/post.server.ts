import { prisma } from "~/db.server";
import type { Post } from '@prisma/client';

export type { Post };

type Post = {
  slug: string;
  title: string;
};

export async function getPosts() {
  return prisma.post.findMany();
};

export async function getPost(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
};

export async function createPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.create({ data: post})
}

export async function editPost(
  post: Pick<Post, "slug" | "title" | "markdown">
) {
  return prisma.post.update({ data: post})
}

export async function deletePost(post){
  return prisma.post.delete(post);
}