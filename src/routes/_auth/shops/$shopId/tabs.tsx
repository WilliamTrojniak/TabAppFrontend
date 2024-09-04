import { getShopForIdQueryOptions } from '@/api/shops'
import { getShopTabsQueryOptions } from '@/api/tabs'
import { TabFormSheet } from '@/components/forms/tab-form'
import { TabsTableCard } from '@/components/tabs-table-card'
import { CreateButton } from '@/components/ui/create-button'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/shops/$shopId/tabs')({
  beforeLoad: () => ({ title: "Tabs" }),
  component: TabComponent
})

function TabComponent() {
  const { shopId } = Route.useParams();
  const { data: shop } = useSuspenseQuery(getShopForIdQueryOptions(shopId))
  const { data: tabs } = useSuspenseQuery(getShopTabsQueryOptions(shopId))
  return <div className='flex flex-col items-start gap-4'>
    <TabFormSheet shop={shop}>
      <CreateButton>Create Tab</CreateButton>
    </TabFormSheet>
    <TabsTableCard shop={shop} tabs={tabs} className='max-w-full' />
    <Outlet />
  </div>

}
