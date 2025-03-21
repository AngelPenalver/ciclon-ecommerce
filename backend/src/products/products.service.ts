import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductResponseDto } from './dto/response-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productServices: Repository<Product>, private readonly usersService: UsersService) { }

  async create({ title, description, price, userId }: CreateProductDto): Promise<ProductResponseDto> {
    //we search for the user, if the user does not exist an error of not found is sent
    const user = await this.usersService.findOneById(userId)

    if (!user) throw new NotFoundException('user not found')

    //if there is a user created, the product is created and subsequently saved in the database
    const product = await this.productServices.create({ title, description, price, user })

    await this.productServices.save(product)

    return { message: 'Product successfully created', product: product }
  }

  async findAll(): Promise<Product[]> {
    const products = await this.productServices.find()
    return products
  }

  async findOneById(id: number): Promise<Product> {
    const product = await this.productServices.findOne({ where: { id } })
    if (!product) throw new NotFoundException('Product not found')
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<string> {
    //first we verify that the product exists, if it does not exist, a not found error is sent.
    const product = await this.findOneById(id)

    if (!product) throw new NotFoundException('Product not found')

    //then if it exists, properties are destructured and the product is simply updated.
    const { title, description, price } = updateProductDto

    await this.productServices.update(id, { title, description, price })

    return 'Product successfully update'
  }

  async remove(id: number): Promise<string> {
    const product = await this.findOneById(id)
    if(!product) throw new NotFoundException('Product not found')
    
    await this.productServices.softDelete(id)
    return `Product with the ${id}, has been successfully eliminated.`;
  }
}