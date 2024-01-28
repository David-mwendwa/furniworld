import Wrapper from './SectionHeader.styles';
import SectionHeader from './sectionHeader';

let meta = { section: 'product', subsection: 'new' };

const NewProduct = () => {
  return (
    <Wrapper>
      <SectionHeader meta={meta} />
      <form
        action='designer-finish.html'
        className='form-horizontal'
        role='form'>
        <div className='form-group'>
          <label htmlFor='name' className='col-sm-3 control-label'>
            Тип заказа
          </label>
          <div className='col-sm-9'>
            <label className='radio-inline'>
              <input
                type='radio'
                name='inlineRadioOptions'
                id='inlineRadio1'
                value='option1'
              />{' '}
              Внешный заказ
            </label>
            <label className='radio-inline'>
              <input
                type='radio'
                name='inlineRadioOptions'
                id='inlineRadio2'
                value='option2'
              />{' '}
              Внутренный заказ
            </label>
          </div>
        </div>

        <div className='form-group'>
          <label htmlFor='name' className='col-sm-3 control-label'>
            Буюртмачи
          </label>
          <div className='col-sm-9'>
            <input
              type='text'
              className='form-control'
              name='name'
              id='name'
              placeholder='Исм ёки корхона номи'
            />
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='name' className='col-sm-3 control-label'>
            Название продукта
          </label>
          <div className='col-sm-9'>
            <input
              type='text'
              className='form-control'
              name='name'
              id='name'
              placeholder='Название'
            />
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='about' className='col-sm-3 control-label'>
            Описание
          </label>
          <div className='col-sm-9'>
            <textarea className='form-control'></textarea>
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='qty' className='col-sm-3 control-label'>
            Количество
          </label>
          <div className='col-sm-3'>
            <input
              type='text'
              className='form-control'
              name='qty'
              id='qty'
              placeholder='шт.'
            />
          </div>
        </div>
        <div className='form-group'>
          <label className='col-sm-3 control-label'>Сроки</label>
          <div className='col-sm-3'>
            <label className='control-label small' htmlFor='date_start'>
              Начало:{' '}
            </label>
            <input
              type='text'
              className='form-control'
              name='date_start'
              id='date_start'
              placeholder='Начало'
            />
          </div>
          <div className='col-sm-3'>
            <label className='control-label small' htmlFor='date_finish'>
              Конец:
            </label>
            <input
              type='text'
              className='form-control'
              name='date_finish'
              id='date_finish'
              placeholder='Конец'
            />
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='name' className='col-sm-3 control-label'>
            Загрузить
          </label>
          <div className='col-sm-3'>
            <label className='control-label small' htmlFor='file_img'>
              Картинка (jpg/png):
            </label>{' '}
            <input type='file' name='file_img' />
          </div>
          <div className='col-sm-3'>
            <label className='control-label small' htmlFor='file_img'>
              Файлы:
            </label>{' '}
            <input type='file' name='file_archive' />
          </div>
        </div>
        <div className='form-group'>
          <label htmlFor='tech' className='col-sm-3 control-label'>
            Технолог
          </label>
          <div className='col-sm-3'>
            <select className='form-control'>
              <option value=''>Выберите</option>
              <option value='texnolog2'>Технолог 2</option>
              <option value='texnolog3'>Технолог 3</option>
            </select>
          </div>
        </div>
        <hr />
        <div className='form-group'>
          <div className='col-sm-offset-3 col-sm-9'>
            <button type='submit' className='btn btn-primary'>
              Отправить
            </button>
          </div>
        </div>
      </form>
    </Wrapper>
  );
};

export default NewProduct;
