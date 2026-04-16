import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeedComment, FeedLike, FeedPost } from 'src/database/entities';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPost)
    private readonly postRepository: Repository<FeedPost>,
    @InjectRepository(FeedComment)
    private readonly commentRepository: Repository<FeedComment>,
    @InjectRepository(FeedLike)
    private readonly likeRepository: Repository<FeedLike>
  ) {}

  async list() {
    const posts = await this.postRepository.find({
      order: { createdAt: 'DESC' },
      take: 20
    });

    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        comments: await this.commentRepository.find({
          where: { postId: post.id },
          order: { createdAt: 'ASC' }
        }),
        likeCount: await this.likeRepository.count({ where: { postId: post.id } })
      }))
    );
  }

  create(authorId: string, dto: CreatePostDto) {
    return this.postRepository.save(
      this.postRepository.create({
        authorId,
        content: dto.content,
        tags: dto.tags ?? []
      })
    );
  }

  async comment(postId: string, authorId: string, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    return this.commentRepository.save(
      this.commentRepository.create({
        postId,
        authorId,
        content: dto.content
      })
    );
  }

  async like(postId: string, userId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    const existing = await this.likeRepository.findOne({ where: { postId, userId } });
    if (existing) {
      return existing;
    }

    return this.likeRepository.save(
      this.likeRepository.create({
        postId,
        userId
      })
    );
  }
}
