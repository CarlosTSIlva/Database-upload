import AppError from '../errors/AppError';
import {
  getCustomRepository,
  getRepository,
  TransactionRepository,
  TreeParent,
} from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Req {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Req): Promise<Transaction> {
    const transactionsRepostitory = getCustomRepository(TransactionsRepository);
    const caterogyRepository = getRepository(Category);

    const { total } = await transactionsRepostitory.getBalance();
    if (type == 'outcome' && total < value) {
      throw new AppError('you do not have enough balance');
    }

    let transactionCategory = await caterogyRepository.findOne({
      where: {
        title: category,
      },
    });
    {
      if (!transactionCategory) {
        transactionCategory = caterogyRepository.create({
          title: category,
        });
        await caterogyRepository.save(transactionCategory);
      }

      const transaction = transactionsRepostitory.create({
        title,
        value,
        type,
        category: transactionCategory,
      });

      await transactionsRepostitory.save(transaction);
      return transaction;
    }
  }
}
export default CreateTransactionService;
