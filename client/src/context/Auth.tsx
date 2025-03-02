import { createContext, useEffect, useState } from 'react';
import { MILVUS_ADDRESS } from '../consts/Localstorage';
import { MilvusHttp } from '../http/Milvus';
import { AuthContextType } from './Types';

export const authContext = createContext<AuthContextType>({
  isAuth: false,
  address: '',
  setAddress: () => {},
  setIsAuth: () => {},
});

const { Provider } = authContext;
export const AuthProvider = (props: { children: React.ReactNode }) => {
  // get milvus address from local storage
  const [address, setAddress] = useState<string>(
    window.localStorage.getItem(MILVUS_ADDRESS) || ''
  );
  const [isAuth, setIsAuth] = useState<boolean>(address !== '');
  // const isAuth = useMemo(() => !!address, [address]);

  useEffect(() => {
    // check if the milvus is still available
    const check = async () => {
      const milvusAddress = window.localStorage.getItem(MILVUS_ADDRESS) || '';
      if (!milvusAddress) {
        return;
      }
      try {
        const res = await MilvusHttp.check(milvusAddress);
        setAddress(res.connected ? milvusAddress : '');
        res.connected && setIsAuth(true);
        if (!res.connected) {
          window.localStorage.removeItem(MILVUS_ADDRESS);
        }
      } catch (error) {
        setAddress('');
        window.localStorage.removeItem(MILVUS_ADDRESS);
      }
    };
    check();
  }, [setAddress]);

  useEffect(() => {
    document.title = address ? `${address} - Attu` : 'Attu';
  }, [address]);

  return (
    <Provider value={{ isAuth, address, setAddress, setIsAuth }}>
      {props.children}
    </Provider>
  );
};
