import React from 'react';
import { Box, Stack, styled } from '@mui/material';

const Footer = () => {

  const StackColumn = styled(Stack)(() => ({
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: '3vh',  
    textAlign: 'center',
  }));

  const BoxRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#ededed',
    flex: 1,
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center', // Center content vertically
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      gap: '3vh',
    }
  }));

  return (
    <BoxRow component='footer' sx={{ py: 4, px: 2 }}>
      <StackColumn>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <div className="bg-white w-full h-auto py-8 flex items-center justify-center gap-4 flex-wrap">
            <a target="_blank" rel="noreferrer noopener" href="https://x.com/trivexxyz" aria-label="X">
              <svg viewBox="0 0 20 20" width="3vh" height="3vh" color="textSubtle" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.28064 10.6416L2.20837 2.9165H7.01804L10.7664 7.69116L14.7709 2.938H17.4198L12.0472 9.3226L18.4177 17.4373H13.6224L9.56365 12.2738L5.23057 17.423H2.5673L8.28064 10.6416ZM14.3213 16.006L5.1575 4.34783H6.31855L15.4708 16.006H14.3213Z"></path>
              </svg>
            </a>

            <a target="_blank" rel="noreferrer noopener" href="" aria-label="">
              <svg viewBox="0 0 20 20" width="3vh" height="3vh" color="textSubtle" xmlns="http://www.w3.org/2000/svg">
              </svg>
            </a>

            <a target="_blank" rel="noreferrer noopener" href="https://discord.gg/vsvGqs8YKZ" aria-label="Discord">
              <svg viewBox="0 0 20 20" width="3vh" height="3vh" color="textSubtle" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.93 1.644A16.491 16.491 0 0012.86.38a.062.062 0 00-.066.031c-.175.313-.37.72-.506 1.041a15.226 15.226 0 00-4.573 0A10.54 10.54 0 007.2.412a.064.064 0 00-.065-.031 16.447 16.447 0 00-4.07 1.263.058.058 0 00-.028.023C.444 5.54-.266 9.319.083 13.05a.069.069 0 00.026.047 16.584 16.584 0 004.994 2.525.064.064 0 00.07-.023c.385-.526.728-1.08 1.022-1.662a.063.063 0 00-.035-.088 10.917 10.917 0 01-1.56-.744.064.064 0 01-.007-.106c.105-.079.21-.16.31-.243a.062.062 0 01.065-.009c3.273 1.495 6.817 1.495 10.051 0a.062.062 0 01.066.008c.1.083.204.165.31.244a.064.064 0 01-.005.106c-.499.291-1.017.537-1.561.743a.064.064 0 00-.034.089c.3.582.643 1.135 1.02 1.66a.063.063 0 00.07.025 16.53 16.53 0 005.003-2.525.064.064 0 00.026-.046c.417-4.314-.699-8.061-2.957-11.384a.05.05 0 00-.026-.023zM6.684 10.778c-.985 0-1.797-.905-1.797-2.016 0-1.11.796-2.015 1.797-2.015 1.01 0 1.814.912 1.798 2.015 0 1.111-.796 2.016-1.798 2.016zm6.646 0c-.986 0-1.797-.905-1.797-2.016 0-1.11.796-2.015 1.797-2.015 1.009 0 1.813.912 1.797 2.015 0 1.111-.788 2.016-1.797 2.016z"></path>
              </svg>
            </a>

            <a target="_blank" rel="noreferrer noopener" href="" aria-label="">
              <svg viewBox="0 0 20 20" width="3vh" height="3vh" color="textSubtle" xmlns="http://www.w3.org/2000/svg">
              </svg>
            </a>

            <a target="_blank" rel="noreferrer noopener" href="https://t.me/trivexxyz" aria-label="Telegram">
              <svg viewBox="0 0 20 20" width="3vh" height="3vh" color="textSubtle" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.478 0 0 4.478 0 9.99 0 15.511 4.478 20 10 20s10-4.488 10-10.01C20 4.477 15.522 0 10 0zm4.925 6.28c-.064.927-1.78 7.856-1.78 7.856s-.107.406-.48.416a.644.644 0 01-.49-.192c-.395-.33-1.29-.97-2.132-1.556a.953.953 0 01-.107.096c-.192.17-.48.416-.789.714a10.7 10.7 0 00-.373.352l-.01.01a2.214 2.214 0 01-.193.171c-.415.341-.458.053-.458-.096l.224-2.441v-.021l.01-.022c.011-.032.033-.043.033-.043s4.36-3.88 4.477-4.296c.01-.021-.021-.042-.074-.021-.288.096-5.31 3.273-5.864 3.625-.032.02-.128.01-.128.01l-2.441-.8s-.288-.117-.192-.383c.021-.053.053-.107.17-.181.544-.384 10-3.785 10-3.785s.267-.085.427-.032c.074.032.117.064.16.17.01.043.021.128.021.224 0 .054-.01.118-.01.224z"></path>
              </svg>
            </a>

          </div>

        </Stack>
        &copy; 2025 Trivex
      </StackColumn>
    </BoxRow>
  );
};

export default Footer;
