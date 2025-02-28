import TopRow from '@components/topRow';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import OrdinalsIcon from '@assets/img/nftDashboard/ordinals_icon.svg';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BottomTabBar from '@components/tabBar';
import FundsRow from './fundsRow';

const RestoreFundTitle = styled.h1((props) => ({
  ...props.theme.body_l,
  marginBottom: 15,
  marginTop: 24,
  marginLeft: 16,
  marginRight: 16,
  color: props.theme.colors.white[200],
}));

const Container = styled.div({
  flex: 1,
  marginTop: 32,
  paddingLeft: 16,
  paddingRight: 16,
});

function RestoreFunds() {
  const { t } = useTranslation('translation', { keyPrefix: 'RESTORE_FUND_SCREEN' });
  const navigate = useNavigate();
  const location = useLocation();
  const { unspentUtxos } = location.state;

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const handleOnRestoreBtcClick = () => {
    navigate('/recover-btc', {
      state: {
        unspentUtxos,
      },
    });
  };

  const handleOnRestoreOridnalClick = () => {
    navigate('/recover-ordinals');
  };

  return (
    <>
      <TopRow title={t('TITLE')} onClick={handleOnCancelClick} />
      <RestoreFundTitle>{t('DESCRIPTION')}</RestoreFundTitle>
      <Container>
        <FundsRow image={IconBitcoin} title={t('RECOVER_BTC')} description={t('RECOVER_BTC_DESC')} onClick={handleOnRestoreBtcClick} />
        <FundsRow image={OrdinalsIcon} title={t('RECOVER_ORDINALS')} description={t('RECOVER_ORDINALS_DESC')} onClick={handleOnRestoreOridnalClick}  />
      </Container>
      <BottomTabBar tab="nft" />
    </>
  );
}

export default RestoreFunds;
